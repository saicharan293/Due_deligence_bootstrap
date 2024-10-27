SELECT * FROM public.department;

SELECT * From public.table_data;

DELETE FROM table_data
WHERE table_name = 'sub';

INSERT INTO public.department (deptname) VALUES
('Electrical System'),
('Mechanical System'),
('Water and Waste System'),
('Fire Protection System'),
('Building Services and Amenities'),
('Security System');

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

SELECT *
FROM
  information_schema.columns
WHERE
  table_name = 'table_data';

select *
from table_data
where false;