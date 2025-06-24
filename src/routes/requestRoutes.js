const express = require("express");
const { getAllRequests, addNewRequest, approveRequestById, finalizeRequestById, completeRequestById, pendingRequestById, getRequestById, getMigrationHistoryByRequestId, incrementAlertCount, VDHapproveRequestById } = require("../controllers/requestController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

module.exports = (upload) => {
    // GET /api/requests - Fetch all change requests
    router.get("/", authMiddleware(["maker", "approver", "master", "ops_vdh", "dev_vdh"]), getAllRequests);

    // GET /api/requests/[id] - Fetch request by id
    router.get("/:id(\\d+)", authMiddleware(["maker", "approver", "master", "ops_vdh", "dev_vdh"]), getRequestById);

    // GET /api/requests/history/[id] - Fetch request by id
    router.get("/history/:id(\\d+)", authMiddleware(["maker", "approver", "master", "ops_vdh", "dev_vdh"]), getMigrationHistoryByRequestId);

    // POST /api/requests - Create a new change request
    router.post("/", authMiddleware(["maker", "master"]), upload.fields([
        { name: 'compliance_checklist', maxCount: 1 },
        { name: 'procedure_checklist', maxCount: 1 },
        { name: 'rollback_checklist', maxCount: 1 },
        { name: 'architecture_diagram', maxCount: 1 },
        { name: 'captures', maxCount: 1 },
    ]), addNewRequest);

    // PUT /api/requests/approve/[id] - Approve request by id
    router.put("/approve/:id(\\d+)", authMiddleware(["approver", "master"]), upload.none(), approveRequestById);

    // PUT /api/requests/finalize/:id(\\d+) - Finalize request by id (No file upload here)
    router.put("/finalize/:id(\\d+)", authMiddleware(["approver", "master"]), upload.fields([
        { name: 'compliance_checklist', maxCount: 1 },
        { name: 'procedure_checklist', maxCount: 1 },
        { name: 'rollback_checklist', maxCount: 1 },
        { name: 'architecture_diagram', maxCount: 1 },
        { name: 'captures', maxCount: 1 },
    ]), finalizeRequestById);

    // POST /api/requests/pending/:id(\\d+) - Pending request by id
    router.post("/pending/:id(\\d+)", authMiddleware(["maker", "master"]), upload.none(), pendingRequestById);

    // POST /api/requests/alert/:id(\\d+) - Alert request by id
    router.post("/alert/:id(\\d+)", authMiddleware(["approver", "master"]), upload.none(), incrementAlertCount);

    // POST /api/requests/approve_vdh/:id(\\d+) - Approve VDH request by id
    router.post("/approve_vdh/:id(\\d+)", authMiddleware(["ops_vdh", "dev_vdh", "master"]), upload.none(), VDHapproveRequestById);

    // POST /api/requests/complete/:id(\\d+) - Complete request by id
    router.post("/complete/:id(\\d+)", authMiddleware(["maker", "master"]), upload.fields([
        { name: 'compliance_checklist', maxCount: 1 },
        { name: 'procedure_checklist', maxCount: 1 },
        { name: 'rollback_checklist', maxCount: 1 },
        { name: 'architecture_diagram', maxCount: 1 },
        { name: 'captures', maxCount: 1 },
        { name: 'completion_report', maxCount: 1 },
    ]), completeRequestById);

    return router;
}