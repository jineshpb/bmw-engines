CREATE TABLE car_generation_engine_classes (
  generation_id uuid REFERENCES car_generations(id),
  engine_class_id uuid REFERENCES engine_classes(id),
  PRIMARY KEY (generation_id, engine_class_id)
);

CREATE TABLE car_generation_engines (
  generation_id uuid REFERENCES car_generations(id),
  engine_id uuid REFERENCES engines(id),
  years text,  -- to store the production years for this specific combination
  PRIMARY KEY (generation_id, engine_id)
);