-- Drop existing constraints first (if any)
ALTER TABLE car_generations 
DROP CONSTRAINT IF EXISTS car_generations_model_chassis_unique;

ALTER TABLE car_models 
DROP CONSTRAINT IF EXISTS car_models_make_name_unique;

ALTER TABLE car_makes 
DROP CONSTRAINT IF EXISTS car_makes_name_unique;

-- Create constraints with correct column names
ALTER TABLE car_makes
ADD CONSTRAINT car_makes_name_unique UNIQUE (name);

ALTER TABLE car_models
ADD CONSTRAINT car_models_make_name_unique UNIQUE (make_id, name);

ALTER TABLE car_generations
ADD CONSTRAINT car_generations_model_chassis_unique UNIQUE (model_id, name, start_year);