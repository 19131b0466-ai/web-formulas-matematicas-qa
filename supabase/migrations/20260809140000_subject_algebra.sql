-- Register Álgebra as a third subject (seed also upserts; this pins a stable UUID).
INSERT INTO subjects (id, slug, title, description, sort_order)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'algebra',
  'Álgebra',
  'Álgebra para Ingeniería y Ciencias de la Computación',
  3
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
