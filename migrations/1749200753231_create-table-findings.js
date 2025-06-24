/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('findings', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    category: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    root_cause: {
      type: 'TEXT',
      notNull: true,
    },
    recommendation: {
      type: 'TEXT',
      notNull: true,
    },
    commitment: {
      type: 'TEXT',
      notNull: true,
    },
    commitment_date: {
      type: 'TEXT',
      notNull: true,
    },
    person_in_charge: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('findings');
};
