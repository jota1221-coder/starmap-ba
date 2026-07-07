-- Migración manual (no generada por diff de schema.prisma): CHECK constraints
-- de integridad + trigger que mantiene ratingAvg/ratingCount siempre correctos.
--
-- Los rangos ya se validan en la app (server actions), pero nada los fuerza
-- a nivel de datos: un futuro endpoint admin, un fix manual en la consola de
-- Neon, o el propio seed podrían insertar un valor inválido sin que nada lo
-- impida. Estos CHECKs son la última línea de defensa.

ALTER TABLE "Review" ADD CONSTRAINT "review_rating_range" CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "Review" ADD CONSTRAINT "review_cuerpo_length" CHECK (char_length(cuerpo) <= 1000);
ALTER TABLE "ObservationPoint" ADD CONSTRAINT "point_bortle_range" CHECK (bortle BETWEEN 1 AND 9);
ALTER TABLE "ObservationPoint" ADD CONSTRAINT "point_lat_range" CHECK (lat BETWEEN -90 AND 90);
ALTER TABLE "ObservationPoint" ADD CONSTRAINT "point_lng_range" CHECK (lng BETWEEN -180 AND 180);

-- Recalcula ratingAvg/ratingCount de un punto desde la tabla Review (fuente
-- de verdad). Función reutilizable: la llama el trigger de abajo, pero
-- también sirve para un fix manual puntual si hiciera falta.
CREATE OR REPLACE FUNCTION recompute_point_rating(target_id INTEGER) RETURNS VOID AS $$
BEGIN
  UPDATE "ObservationPoint" p
  SET "ratingAvg" = COALESCE(s.avg, 0), "ratingCount" = COALESCE(s.cnt, 0)
  FROM (
    SELECT AVG(rating)::float8 AS avg, COUNT(*)::int AS cnt
    FROM "Review"
    WHERE "pointId" = target_id AND status = 'APPROVED'
  ) s
  WHERE p.id = target_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: cualquier INSERT/UPDATE/DELETE sobre Review recalcula el punto
-- afectado — sin depender de que el código de la app se acuerde de llamarlo.
-- Esto cubre además el borrado en cascada de un User (sus reviews desaparecen
-- y el punto se recalcula solo, en vez de quedar con un rating "fantasma").
CREATE OR REPLACE FUNCTION trg_recompute_point_rating() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recompute_point_rating(OLD."pointId");
  ELSIF TG_OP = 'UPDATE' AND OLD."pointId" IS DISTINCT FROM NEW."pointId" THEN
    PERFORM recompute_point_rating(OLD."pointId");
    PERFORM recompute_point_rating(NEW."pointId");
  ELSE
    PERFORM recompute_point_rating(NEW."pointId");
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS review_rating_recompute ON "Review";
CREATE TRIGGER review_rating_recompute
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW EXECUTE FUNCTION trg_recompute_point_rating();
