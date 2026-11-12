BEGIN;

-- MH-AWARD-0045: digitization artifact -- shaped exactly like the street
-- network (not a real building/land parcel), confirmed visually against
-- surrounding small parcels. Same category as the parcels already removed
-- in 20260926150000_delete_a_ward_selected_parcels.sql.

DELETE FROM public.project_parcels pp
USING public.parcels p
WHERE pp.parcel_id = p.id
  AND p.parcel_ref IN (
    'MH-AWARD-0045'
  );

DELETE FROM public.land_interests li
USING public.parcels p
WHERE li.parcel_id = p.id
  AND p.parcel_ref IN (
    'MH-AWARD-0045'
  );

DELETE FROM public.parcels
WHERE parcel_ref IN (
  'MH-AWARD-0045'
);

COMMIT;
