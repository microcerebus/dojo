import type { CourseModule } from '../../types';

export const databases: CourseModule = {
  id: 'databases',
  title: 'Databases',
  track: 'reference',
  status: 'complete',
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
  sections: [
    {
      id: 'querying',
      title: 'Reading the query in the order the engine does',
      takeaway: 'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Not the order you type it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'SQL is written in one order and evaluated in another, and almost every confusing error comes from that gap. The engine builds the row set first, then groups it, then filters the groups, and only then computes what you asked to see.',
        },
        {
          kind: 'table',
          headers: ['#', 'Clause', 'What it does'],
          rows: [
            ['1', '`FROM` / `JOIN`', 'Assemble the rows to work from'],
            ['2', '`WHERE`', 'Throw away **rows** - before any grouping exists'],
            ['3', '`GROUP BY`', 'Collapse the surviving rows into groups'],
            ['4', '`HAVING`', 'Throw away **groups** - can use aggregates'],
            ['5', '`SELECT`', 'Compute the output columns (aliases are born here)'],
            ['6', '`ORDER BY` / `LIMIT`', 'Sort and cut'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'WHERE vs HAVING, settled',
          text: '`WHERE` runs before grouping, so it cannot see an aggregate. `HAVING` runs after, so it can. "Tenants renting more than one apartment" is a group condition - `HAVING count(*) > 1` - because the count does not exist until the grouping has happened.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: '14.1 - tenants renting more than one apartment',
          code: `SELECT TenantName
FROM Tenants
INNER JOIN (
  SELECT TenantID
  FROM AptTenants
  GROUP BY TenantID
  HAVING count(*) > 1
) C ON Tenants.TenantID = C.TenantID;`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The GROUP BY rule',
          text: 'Everything in `SELECT` must be either an aggregate or listed in `GROUP BY`. Grouping by `StudentID` and selecting `StudentName` is rejected: the engine has a *group* of rows and no instruction for which name to pick, even if they are all identical. Fix it by adding the column to `GROUP BY`, wrapping it in an aggregate like `max()`, or wrapping the whole query and joining the name back on afterwards.',
        },
        {
          kind: 'p',
          text: 'Aggregates and NULL is the other quiet trap. `COUNT(*)` counts rows; `COUNT(column)` counts non-NULL values in that column - that difference is the whole of the next section\'s bug. `SUM`, `AVG`, `MIN` and `MAX` all skip NULLs, so `AVG` divides by the number of non-NULL values, not by the row count. And an aggregate over zero rows returns NULL, not 0 - which is why `SELECT max(salary) …` on an empty result gives you NULL, and is exactly what "second highest salary" is testing.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Updates take a WHERE clause too - 14.3',
          code: `UPDATE Requests
SET Status = 'Closed'
WHERE AptID IN (SELECT AptID FROM Apartments WHERE BuildingID = 11);`,
        },
        {
          kind: 'p',
          text: 'Two more shapes worth recognising. A plain **subquery** runs once and hands its result to the outer query, as above. A **correlated subquery** references the outer row, so conceptually it runs per row - `WHERE salary > (SELECT avg(salary) FROM Emp e2 WHERE e2.dept = e1.dept)`. Correlated subqueries read beautifully and can be slow; a join or a window function usually expresses the same thing and optimises better. Say that you know the difference and pick deliberately.',
        },
      ],
    },
    {
      id: 'joins',
      title: 'Joins, and the bug everyone writes',
      takeaway: 'INNER silently drops rows; LEFT JOIN plus COUNT(*) silently counts them as one.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A join combines two tables on a matching field. The join type decides which rows make it into the result - and that is the entire content of question 14.4.',
        },
        { kind: 'anim', animId: 'db-joins' },
        {
          kind: 'table',
          headers: ['Join', 'Returns', 'Reach for it when'],
          rows: [
            [
              '`INNER JOIN`',
              'Only rows matching on both sides',
              'You genuinely only want pairs that exist',
            ],
            [
              '`LEFT OUTER JOIN`',
              'Every left row; NULLs where the right had no match',
              '"Every X, with its Ys if any" - the most common requirement',
            ],
            [
              '`RIGHT OUTER JOIN`',
              'The mirror image',
              'Rarely - `A LEFT JOIN B` is `B RIGHT JOIN A`, so most people only write LEFT',
            ],
            [
              '`FULL OUTER JOIN`',
              'Everything from both sides, NULL-padded',
              'Reconciling two sources and finding the mismatches',
            ],
            [
              '`CROSS JOIN`',
              'Every left row × every right row',
              'Generating grids - or by accident, when you forget the ON clause',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'INNER JOIN deletes your zeroes',
          text: 'Ask for "all students and how many courses each takes" with an INNER JOIN and the students taking none vanish - the row you most wanted to see is the one that disappears. The moment a requirement contains "all" or "each", check whether an outer join is what you meant.',
        },
        {
          kind: 'p',
          text: 'Then the follow-on bug, which is the sharpest edge in this chapter. Switch to a LEFT JOIN and a student with no courses now produces one row, with NULLs on the right - so counting rows reports 1, not 0. Counting a column from the joined table fixes it instead, because NULLs are never counted.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'Every student, and how many courses - all three problems fixed',
          code: `SELECT s.StudentName,
       s.StudentID,
       count(sc.CourseID) AS Cnt   -- not count(*): NULLs must not count
FROM Students
LEFT JOIN StudentCourses sc       -- not INNER: keep students with no courses
  ON s.StudentID = sc.StudentID
GROUP BY s.StudentID, s.StudentName;  -- name must be grouped or aggregated`,
        },
        {
          kind: 'p',
          text: 'The same three fixes carry question 14.2 - "every building and its number of open requests". Aggregate the open requests per building first, then LEFT JOIN that onto Buildings so a building with none still appears, and convert its NULL count to zero with `ISNULL(...)` or `COALESCE(...)`. Buildings with zero open requests are precisely the rows a facilities manager wants to see, so losing them is not a cosmetic bug.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Test subqueries inside out',
          text: 'When a query has a nested aggregate, run the inner part on its own first and eyeball the rows, then wrap it. Debugging a five-line query as one unit is how you end up staring at a correct-looking query that returns nothing.',
        },
        {
          kind: 'p',
          text: 'A **self-join** is the same table joined to itself under two aliases - "employees earning more than their manager" is `Employee e JOIN Employee m ON e.ManagerId = m.Id WHERE e.Salary > m.Salary`. It looks exotic once and then never again.',
        },
      ],
    },
    {
      id: 'schema',
      title: 'Designing the schema',
      takeaway: 'Same four steps as object design; junction tables carry many-to-many.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Designing a database is the object-oriented design method with tables instead of classes: handle the ambiguity, define the core objects, analyse the relationships, then walk the actions through. Asked to model an apartment rental agency, find out whether there is one location or many, and how general the design must be - a person renting two apartments in one building is rare, but "rare" and "impossible" are different requirements.',
        },
        {
          kind: 'table',
          headers: ['Cardinality', 'How it is stored', 'Example'],
          rows: [
            [
              'One-to-many',
              'A foreign key on the *many* side',
              '`Apartments.BuildingID` → `Buildings`',
            ],
            [
              'Many-to-many',
              'A third table holding both keys',
              '`AptTenants(TenantID, AptID)` - and it can carry its own columns, like a lease start date',
            ],
            [
              'One-to-one',
              'A foreign key with a unique constraint',
              'A user and their settings row',
            ],
            [
              'Is-a',
              'A shared key plus a table of the extra attributes',
              'Every Professional is a Person, with a degree and work experience on top',
            ],
          ],
        },
        {
          kind: 'p',
          text: 'That last row is question 14.6. Companies, people and professionals: a Professional **is a** Person with extra attributes, and works for one Company while a Company hires many - so "Works For" is a many-to-one relationship. The detail worth spotting is that the relationship itself has attributes: start date and salary belong to the *employment*, not to the person and not to the company. And a person can have several phone numbers, which is a multi-valued attribute and therefore its own table.',
        },
        { kind: 'anim', animId: 'db-normalisation' },
        {
          kind: 'p',
          text: "**Normalisation** minimises redundancy: store each fact once, so it cannot contradict itself. Courses holds a `TeacherID`, and the teacher's name lives in exactly one row of Teachers, so a rename is a single-row update. The cost is joins on read.",
        },
        {
          kind: 'p',
          text: '**Denormalisation** trades that back: copy `TeacherName` into Courses too, and the common read becomes a single-table query. Question 14.5 wants both columns of the ledger.',
        },
        {
          kind: 'table',
          headers: ['Denormalisation buys', 'Denormalisation costs'],
          rows: [
            ['Faster reads - fewer or no joins', 'Slower, more complex inserts and updates'],
            ['Simpler queries, so fewer query bugs', 'More storage, since data is repeated'],
            [
              'Fewer tables to touch on a hot path',
              'Copies can disagree, and nothing says which is right',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'When it is the right call',
          text: 'Read-heavy workloads, joins that have measurably become the bottleneck, and analytics tables that are rebuilt rather than edited. Anything at real scale uses both - normalised where correctness dominates, denormalised where reads do. "It depends" is the wrong answer; "here, and here is what it costs me" is the right one.',
        },
        {
          kind: 'p',
          text: '**14.7, the grade database.** Three tables carry it: `Students`, `Courses`, and `CourseEnrollment` pairing them with a grade and a term - the junction table again, with attributes. Then the honour-roll query has a genuine trap. `SELECT TOP 10 PERCENT … ORDER BY GPA` returns literally the top 10% of *rows*, so if fifteen students out of a hundred all have a 4.0, ten of them make the list and five identical students do not. Compute the cut-off GPA first, then select everyone at or above it - and accept that ties can push the honour roll past 10%.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Name your assumptions here too',
          text: 'That schema quietly assumes one professor per course. Maybe that is fine; at some universities it is not. You cannot avoid assuming - flexibility and complexity trade against each other, and a schema flexible enough for every situation is unusable. Just say which assumptions you made.',
        },
      ],
    },
    {
      id: 'performance',
      title: 'Indexes, transactions, and going large',
      takeaway: 'Index what you filter on; wrap multi-row changes in a transaction.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Without an index, finding rows by a column means reading every row. An index is that column kept sorted (usually as a B-tree) beside the table, with a pointer back to each row - so a lookup becomes a seek.',
        },
        { kind: 'anim', animId: 'db-index' },
        {
          kind: 'bullets',
          items: [
            '**Index what you filter, join and sort on.** Foreign keys especially - an unindexed foreign key turns every join through it into a scan.',
            '**Every index slows writes.** Each insert, update and delete has to maintain each affected index, and each index takes disk. Six indexes on a write-heavy table is a design mistake, not thoroughness.',
            '**Composite column order matters.** An index on `(a, b)` is sorted by `a` first, so it serves `WHERE a = ?` and `WHERE a = ? AND b = ?`, but not `WHERE b = ?` alone. It is a phone book sorted by surname then first name: useless for finding every "Sara".',
            '**Low-selectivity columns barely help.** An index on a boolean that is 50/50 saves almost nothing, because half the table still has to be read.',
          ],
        },
        {
          kind: 'p',
          text: '**Transactions** make several statements one atomic unit: they all take effect or none do, and until they commit, nobody else sees the half-done state. Any change spanning more than one row or table needs one - transferring money, closing every request in a building while also flagging the building as under renovation, or inserting a parent row and its children.',
        },
        {
          kind: 'code',
          lang: 'sql',
          caption: 'All or nothing',
          code: `BEGIN TRANSACTION;
  UPDATE Requests SET Status = 'Closed'
   WHERE AptID IN (SELECT AptID FROM Apartments WHERE BuildingID = 11);
  UPDATE Buildings SET Status = 'Renovating' WHERE BuildingID = 11;
COMMIT;   -- ROLLBACK undoes both if anything fails`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'What changes at large scale',
          text: 'Everything above assumes the data fits on one machine. When it does not, joins become the thing that will not scale, so you denormalise deliberately and duplicate data into the tables that read it. Split the data by a key you actually query on, replicate for read throughput and failover, and accept that cross-partition joins and transactions largely stop being available. That is the bridge into the system-design module.',
        },
        {
          kind: 'p',
          text: 'Finally, **schema evolution**. Real schemas change under live traffic, and the safe shape is always expand-then-contract: add the new nullable column, backfill it in batches, write to both old and new for a release, switch reads over, and only then drop the old one. Adding a column is cheap; renaming or dropping one is a breaking change for every reader. Migrations that lock a large table for the duration are the classic self-inflicted outage - and mentioning that you would batch it is the kind of detail that marks out someone who has actually shipped one.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'db-1',
      kind: 'concept',
      prompt: 'What is the difference between WHERE and HAVING?',
      options: [
        'They are interchangeable',
        'WHERE filters rows before grouping; HAVING filters groups after, so only HAVING can use an aggregate',
        'HAVING is for joins; WHERE is for single tables',
        'WHERE is faster but only works on indexed columns',
      ],
      answerIndex: 1,
      explain:
        'The count does not exist until grouping has happened, which is why "more than one apartment" is `HAVING count(*) > 1`.',
    },
    {
      id: 'db-2',
      kind: 'technique',
      prompt:
        'You LEFT JOIN Students to StudentCourses and `count(*)` the courses per student. What goes wrong?',
      options: [
        'Students with no courses are dropped',
        'Students with no courses report 1 - their NULL-padded row still counts. Use `count(sc.CourseID)`',
        'The query fails to compile',
        'Duplicate students appear',
      ],
      answerIndex: 1,
      explain:
        '`count(*)` counts rows; `count(column)` skips NULLs. That single character is the difference between 1 and 0.',
    },
    {
      id: 'db-3',
      kind: 'concept',
      prompt: 'Which join keeps every row of the left table even with no match on the right?',
      options: ['INNER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN', 'FULL OUTER JOIN only'],
      answerIndex: 1,
      explain:
        'Unmatched right-hand columns come back NULL. Any requirement containing "all X" or "each X" is a hint to reach for it.',
    },
    {
      id: 'db-4',
      kind: 'concept',
      prompt:
        'You group by `StudentID` and select `StudentName` without aggregating it. What happens?',
      options: [
        'It works - names within a group are identical anyway',
        'It is rejected: every selected column must be aggregated or in the GROUP BY',
        'It returns the alphabetically first name',
        'It returns NULL',
      ],
      answerIndex: 1,
      explain:
        'The engine has a group, not a row, and no rule for which name to pick. Group by it, aggregate it, or join it back on.',
    },
    {
      id: 'db-5',
      kind: 'concept',
      prompt:
        'A tenant can rent several apartments and an apartment can have several tenants. How is that stored?',
      options: [
        'A list column on Tenants',
        'A junction table holding both keys - which can also carry attributes like the lease start date',
        'A foreign key on Apartments',
        'Two one-to-many relationships in the same table',
      ],
      answerIndex: 1,
      explain:
        'Many-to-many always needs a third table, and it is the natural home for anything belonging to the pairing itself.',
    },
    {
      id: 'db-6',
      kind: 'concept',
      prompt: 'What does denormalisation cost you?',
      options: [
        'Nothing - it is strictly faster',
        'More expensive writes, more storage, and copies that can disagree with each other',
        'The ability to use indexes',
        'Transaction support',
      ],
      answerIndex: 1,
      explain:
        'You buy read speed and simpler queries by accepting redundancy - and every redundant copy is a chance to be inconsistent.',
    },
    {
      id: 'db-7',
      kind: 'complexity',
      prompt: 'You have an index on `(lastName, firstName)`. Which query does it help?',
      options: [
        "`WHERE firstName = 'Sara'`",
        "`WHERE lastName = 'Chen'` and `WHERE lastName = 'Chen' AND firstName = 'Sara'`",
        'Every query on either column',
        'Only queries using both columns together',
      ],
      answerIndex: 1,
      explain:
        'A composite index is sorted left to right. Like a phone book by surname then first name - useless for finding every Sara.',
    },
    {
      id: 'db-8',
      kind: 'technique',
      prompt:
        '"Honour roll = top 10% by GPA." Why is `SELECT TOP 10 PERCENT … ORDER BY GPA` wrong?',
      options: [
        'It sorts the wrong way',
        'It returns literally 10% of rows, so students tied at the cut-off are arbitrarily excluded',
        'TOP cannot be combined with ORDER BY',
        'It ignores students with no grades',
      ],
      answerIndex: 1,
      explain:
        'Find the cut-off GPA first, then take everyone at or above it - and accept that ties may push the list past 10%.',
    },
    {
      id: 'db-9',
      kind: 'concept',
      prompt: 'Why wrap two related UPDATE statements in a transaction?',
      options: [
        'It makes them faster',
        'So they are atomic: both take effect or neither does, and nobody sees the half-done state',
        'It bypasses index maintenance',
        'It is required whenever a query has a WHERE clause',
      ],
      answerIndex: 1,
      explain:
        'Any change spanning more than one row or table needs it - otherwise a failure between the two leaves the data inconsistent.',
    },
    {
      id: 'db-10',
      kind: 'technique',
      prompt: 'How do you add a required column to a large, live table safely?',
      options: [
        'Add it with NOT NULL and a default in one statement',
        'Expand then contract: add it nullable, backfill in batches, write to both, switch reads, then tighten',
        'Take the service down for the migration',
        'Create a new table and drop the old one',
      ],
      answerIndex: 1,
      explain:
        'A single blocking migration can lock the table for the duration. Batching the backfill is what keeps the service up.',
    },
  ],
  drills: [
    {
      slug: 'combine-two-tables',
      note: 'CTCI 14.2 shape - LEFT JOIN so rows without a match survive.',
    },
    { slug: 'duplicate-emails', note: 'CTCI 14.1 shape - GROUP BY with HAVING COUNT > 1.' },
    { slug: 'employees-earning-more-than-their-managers', note: 'Self-join.' },
    {
      slug: 'department-highest-salary',
      note: 'Grouped maximum with a join back - a genuinely common pattern.',
    },
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
