import type { CourseModule } from '../../types';

export const databases: CourseModule = {
  id: 'databases',
  title: 'Databases',
  track: 'reference',
  status: 'outline',
  source: 'Chapter 14',
  summary:
    'Reference track, but high value: joins, normalisation and schema design come up in product-engineering interviews constantly.',
  estimatedMinutes: 50,
  concepts: [
    'SELECT with WHERE, GROUP BY, HAVING and ORDER BY, and the order the engine applies them',
    'The difference between WHERE (filters rows) and HAVING (filters groups)',
    'Aggregates: COUNT, SUM, AVG, MIN, MAX, and how NULL is treated by each',
    'INNER JOIN, LEFT/RIGHT OUTER JOIN, FULL OUTER JOIN and CROSS JOIN - what each returns and when',
    'Why LEFT JOIN plus COUNT needs care: counting a column from the joined table, not *',
    'Subqueries, correlated subqueries, and when a join is clearer',
    'Primary keys, foreign keys and cardinality',
    'Many-to-many relationships and the junction table that models them',
    'Normalisation: eliminating redundancy so updates cannot create contradictions',
    'Denormalisation: duplicating data to avoid joins, and the write cost and staleness it buys',
    'When denormalisation is right: read-heavy workloads, expensive joins, analytics',
    'Entity-relationship modelling, including entities that are themselves relationships',
    'Indexes: what they cost on write, what they buy on read, and composite index column order',
    'Transactions and atomic multi-row updates',
    'Small vs large database design: what changes when the table will not fit on one machine',
    'Schema evolution and migration concerns',
  ],
  plannedAnimations: [
    'The four join types over the same two tables, with the result set changing',
    'A normalised schema being denormalised, showing the read that gets faster and the writes that multiply',
    'An index as a sorted structure beside the table, turning a scan into a seek',
    'An ER diagram assembling: entities, then relationships, then a junction table for many-to-many',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'combine-two-tables', note: 'CTCI 14.2 shape - LEFT JOIN so rows without a match survive.' },
    { slug: 'duplicate-emails', note: 'CTCI 14.1 shape - GROUP BY with HAVING COUNT > 1.' },
    { slug: 'employees-earning-more-than-their-managers', note: 'Self-join.' },
    { slug: 'department-highest-salary', note: 'Grouped maximum with a join back - a genuinely common pattern.' },
    { slug: 'rank-scores', note: 'Window functions, or the pre-window-function equivalent.' },
    { slug: 'second-highest-salary', note: 'The NULL-on-empty case is the whole question.' },
    { slug: 'swap-salary', note: 'CTCI 14.3 shape - a conditional UPDATE.' },
  ],
  practice: [
    {
      id: 'db-schema',
      title: 'Design two schemas on paper',
      detail:
        'A grade database (students, courses, enrolments, grades - support "rank students by average") and an apartment/tenant/maintenance-request model. Draw the ER diagram, then write three queries against each.',
    },
    {
      id: 'db-explain',
      title: 'Be able to explain joins and denormalisation cold',
      detail:
        'Draw the four join types on two small tables. Then give a concrete example of when you would denormalise and what it would cost you.',
    },
  ],
};
