const { pool } = require("../config/db");

// Helper function to extract filename
const getFileName = (req, fieldname) => {
  if (req.files && req.files[fieldname] && req.files[fieldname][0]) {
    return req.files[fieldname][0].filename;
  }
  return null;
};

// Fetch all Requests
const getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.*, 
              requester.name as requester_name, 
              approver.name as approver_name 
       FROM change_requests cr
       LEFT JOIN users requester ON cr.requester_id = requester.id
       LEFT JOIN users approver ON cr.approver_id = approver.id`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Fetch Request by ID
const getRequestById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT cr.*, 
              requester.name as requester_name, 
              approver.name as approver_name 
       FROM change_requests cr
       LEFT JOIN users requester ON cr.requester_id = requester.id
       LEFT JOIN users approver ON cr.approver_id = approver.id
       WHERE cr.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const approveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cab_meeting_date,
    } = req.body;
    const approver_id = req.user?.id || req.headers["x-user-id"] || null;

    const result = await pool.query(`
      UPDATE change_requests 
      SET 
      approver_id = $1, 
      approved_at = NOW(), 
      cab_meeting_date = $2,
      status = 'waiting_finalization' 
      WHERE id = $3 RETURNING *
      `,
      [approver_id, cab_meeting_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0], // Return the updated row
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const VDHapproveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const user_role = req.headers['x-user-role'];

    // Fetch the current status of the request
    const fetchResult = await pool.query(
      `SELECT status FROM change_requests WHERE id = $1`,
      [id]
    );

    if (fetchResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    const currentStatus = fetchResult.rows[0].status;

    // Determine if it is the first approval based on current status and type
    const isFirst = (currentStatus === 'waiting_ops_vdh_approval' && type === 'hardware') ||
                    (currentStatus === 'waiting_dev_vdh_approval' && type === 'software');

    // Check if the user role is allowed to approve the request based on the current status
    if (
      user_role !== 'master' &&
      (
        (currentStatus === 'waiting_dev_vdh_approval' && user_role !== 'dev_vdh') ||
        (currentStatus === 'waiting_ops_vdh_approval' && user_role !== 'ops_vdh')
      )
    ) {
      return res.status(403).json({ success: false, error: "User not authorized to approve this request" });
    }

    let status;
    let timestampColumn;

    if (type === 'software') {
      status = isFirst ? 'waiting_ops_vdh_approval' : 'waiting_migration';
      timestampColumn = isFirst ? 'vdh_development_approved_at' : 'vdh_operations_approved_at';
    } else if (type === 'hardware') {
      status = isFirst ? 'waiting_dev_vdh_approval' : 'waiting_migration';
      timestampColumn = isFirst ? 'vdh_operations_approved_at' : 'vdh_development_approved_at';
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid type. Must be 'software' or 'hardware'.",
      });
    }

    const result = await pool.query(
      `UPDATE change_requests 
       SET status = $1, ${timestampColumn} = NOW() 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0], // Return the updated row
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const finalizeRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isEmergency } = req.query;
    const {
      name, 
      type, 
      category, 
      urgency, 
      requested_migration_date, 
      downtime_risk, 
      integration_risk, 
      uat_result, 
      description,
      group,
      division,
      pic,
      project_code,
      rfc_number,
      cab_meeting_link
    } = req.body;

    const compliance_checklist = getFileName(req, 'compliance_checklist');
    const procedure_checklist = getFileName(req, 'procedure_checklist');
    const rollback_checklist = getFileName(req, 'rollback_checklist');
    const architecture_diagram = getFileName(req, 'architecture_diagram');
    const captures = getFileName(req, 'captures');

    let status = 'waiting_migration';
    if (isEmergency === 'true') {
      if (type === 'hardware') {
        status = 'waiting_ops_vdh_approval';
      } else if (type === 'software') {
        status = 'waiting_dev_vdh_approval';
      }
    }

    // Update the change_requests table
    const updateResult = await pool.query(
      `
      UPDATE change_requests 
      SET 
        name = $1,
        type = $2,
        category = $3,
        urgency = $4,
        requested_migration_date = $5,
        compliance_checklist = $6,
        procedure_checklist = $7,
        rollback_checklist = $8,
        architecture_diagram = $9,
        captures = $10,
        downtime_risk = $11,
        integration_risk = $12,
        uat_result = $13,
        description = $14,
        "group" = $15,
        division = $16,
        pic = $17,
        project_code = $18,
        rfc_number = $19,
        cab_meeting_link = $20,
        finalized_at = NOW(), 
        status = $21
      WHERE id = $22
      RETURNING id, requested_migration_date
      `,
      [
        name, type, category, urgency, requested_migration_date, 
        compliance_checklist, procedure_checklist, rollback_checklist, 
        architecture_diagram, captures, downtime_risk, integration_risk, 
        uat_result, description, group, division, pic, project_code, rfc_number, cab_meeting_link, status, id
      ]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    // Create a migration history entry
    await pool.query(
      `
      INSERT INTO migration_history (change_request_id, migration_date, status, recorded_at)
      VALUES ($1, $2, 'pending', NOW())
      `,
      [id, requested_migration_date]
    );

    res.status(200).json({
      success: true,
      message: "Change request finalized and migration history created",
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const completeRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSucceed } = req.query;
    const status = isSucceed === 'true' ? 'success' : 'failed';

    const compliance_checklist = getFileName(req, 'compliance_checklist');
    const procedure_checklist = getFileName(req, 'procedure_checklist');
    const rollback_checklist = getFileName(req, 'rollback_checklist');
    const architecture_diagram = getFileName(req, 'architecture_diagram');
    const captures = getFileName(req, 'captures');
    const completion_report = getFileName(req, 'completion_report');
    const { post_implementation_review } = req.body;

    // Update the change_requests table
    const updateResult = await pool.query(
      `
      UPDATE change_requests 
      SET 
        compliance_checklist = $1,
        procedure_checklist = $2,
        rollback_checklist = $3,
        architecture_diagram = $4,
        captures = $5,
        completion_report = $6,
        post_implementation_review = $7,
        status = $8,
        finished_at = NOW()
      WHERE id = $9
      RETURNING id, requested_migration_date
      `,
      [
        compliance_checklist, procedure_checklist, rollback_checklist, 
        architecture_diagram, captures, completion_report, 
        post_implementation_review, status, id
      ]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    const { requested_migration_date } = updateResult.rows[0];

    // Update the corresponding migration_history entry
    await pool.query(
      `
      UPDATE migration_history
      SET status = $1
      WHERE change_request_id = $2 
      AND recorded_at = (
        SELECT MAX(recorded_at) 
        FROM migration_history 
        WHERE change_request_id = $2
      )
      `,
      [status, id]
    );

    res.status(200).json({
      success: true,
      message: "Request completed and migration history updated",
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const pendingRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_migration_date, pending_reason } = req.body;

    // Update the change_requests table
    const updateResult = await pool.query(
      `
      UPDATE change_requests 
      SET requested_migration_date = $1, status = 'waiting_migration'
      WHERE id = $2
      RETURNING id
      `,
      [new_migration_date, id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    // Update the previous migration_history entry
    await pool.query(
      `
      UPDATE migration_history
      SET pending_reason = $1
      WHERE change_request_id = $2 
      AND recorded_at = (
        SELECT MAX(recorded_at) 
        FROM migration_history 
        WHERE change_request_id = $2
      )
      `,
      [pending_reason, id]
    );

    // Insert a new entry in migration_history
    await pool.query(
      `
      INSERT INTO migration_history (change_request_id, migration_date, status, recorded_at)
      VALUES ($1, $2, 'pending', NOW())
      `,
      [id, new_migration_date]
    );

    res.status(200).json({
      success: true,
      message: "Migration request updated and new migration history entry added",
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const getMigrationHistoryByRequestId = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch migration history entries for the given request ID
    const result = await pool.query(
      `
      SELECT * FROM migration_history 
      WHERE change_request_id = $1 
      ORDER BY recorded_at
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// controller to increment alert_count by 1, check if its less than alert_limit from the request body
const incrementAlertCount = async (req, res) => { 
  try {
    const { id } = req.params;
    const { alert_limit } = req.body;

    if (!alert_limit || isNaN(alert_limit) || alert_limit <= 0) {
      return res.status(400).json({ success: false, error: "Invalid or missing alert_limit" });
    }

    // Fetch the current alert_count
    const fetchResult = await pool.query(
      `SELECT alert_count FROM change_requests WHERE id = $1`,
      [id]
    );

    if (fetchResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    const currentAlertCount = fetchResult.rows[0].alert_count;

    if (currentAlertCount >= alert_limit) {
      return res.status(400).json({ success: false, error: `Alert count cannot exceed ${alert_limit}` });
    }

    // Update the change_requests table
    const updateResult = await pool.query(
      `
      UPDATE change_requests 
      SET alert_count = alert_count + 1
      WHERE id = $1
      RETURNING id, alert_count
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Alert count updated",
      data: updateResult.rows[0],
    });

  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Insert Request
const addNewRequest = async (req, res) => {
  try {
    const requester_id = req.user?.id || req.headers["x-user-id"] || null; // Ensure requester_id is retrieved

    const {
      type,
      name,
      category,
      urgency,
      requested_migration_date,
      downtime_risk,
      integration_risk,
      uat_result,
      description,
      group,
      division,
      pic,
      project_code,
      rfc_number,
      cab_meeting_link
    } = req.body;

    const compliance_checklist = getFileName(req, 'compliance_checklist');
    const procedure_checklist = getFileName(req, 'procedure_checklist');
    const rollback_checklist = getFileName(req, 'rollback_checklist');
    const architecture_diagram = getFileName(req, 'architecture_diagram');
    const captures = getFileName(req, 'captures');

    // Define mandatory fields including requester_id
    const requiredFields = { requester_id, type, name, category, urgency, requested_migration_date };

    // Check for missing fields
    const missingFields = Object.keys(requiredFields).filter((key) => !requiredFields[key]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const query = `
      INSERT INTO change_requests (
        requester_id, created_at, status, 
        type, name, category, urgency, 
        requested_migration_date,
        compliance_checklist, procedure_checklist, rollback_checklist, architecture_diagram, captures, 
        downtime_risk, integration_risk, uat_result, description,
        "group", division, pic, project_code, rfc_number, cab_meeting_link
      ) VALUES (
        $1, NOW(), 'waiting_approval', 
        $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, $11, 
        $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21
      ) RETURNING *;
    `;

    const values = [
      requester_id,
      type,
      name,
      category,
      urgency,
      requested_migration_date,
      compliance_checklist,
      procedure_checklist,
      rollback_checklist,
      architecture_diagram,
      captures,
      downtime_risk,
      integration_risk,
      uat_result,
      description,
      group,
      division,
      pic,
      project_code,
      rfc_number,
      cab_meeting_link
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Change request created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating change request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getAllRequests, getRequestById, approveRequestById, finalizeRequestById, completeRequestById, pendingRequestById, addNewRequest, getMigrationHistoryByRequestId, incrementAlertCount, VDHapproveRequestById };