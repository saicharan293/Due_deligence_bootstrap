SELECT * FROM public.department;

INSERT INTO public.department (deptname) VALUES
('Electrical System'),
('Mechanical System'),
('Water and Waste System'),
('Fire Protection System'),
('Building Services and Amenities'),
('Security System');

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';