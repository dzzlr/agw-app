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
  pgm.createTable('tasks', {
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
    status: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    deadline: {
      type: 'DATE',
      notNull: true,
    },
    notes: {
      type: 'TEXT',
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
  pgm.dropTable('tasks');
};
