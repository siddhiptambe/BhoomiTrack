SELECT json_build_object(
  'parcel_geometries', (
    SELECT json_agg(json_build_object('parcel_ref', parcel_ref, 'has_geom', geom IS NOT NULL))
    FROM public.parcels 
    WHERE parcel_ref IN ('DEMO-PCL-001', 'DEMO-PCL-002', 'DEMO-PCL-003', 'DEMO-PCL-004')
  ),
  'alignment_geometry', (
    SELECT json_agg(json_build_object('version_ref', version_ref, 'has_geom', geom IS NOT NULL))
    FROM public.alignments 
    WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'DEMO-MH-001')
  ),
  'affected_area', (
    SELECT json_agg(json_build_object('parcel_ref', p.parcel_ref, 'affected_area_sqm', pp.affected_area_sqm))
    FROM public.project_parcels pp 
    JOIN public.parcels p ON pp.parcel_id = p.id 
    WHERE p.parcel_ref IN ('DEMO-PCL-001', 'DEMO-PCL-002', 'DEMO-PCL-003', 'DEMO-PCL-004')
  ),
  'canonical_cases', (
    SELECT json_agg(json_build_object('case_no', c.case_no, 'project_code', pr.project_code, 'parcel_ref', p.parcel_ref))
    FROM public.acquisition_cases c 
    JOIN public.projects pr ON c.project_id = pr.id 
    JOIN public.parcels p ON c.parcel_id = p.id 
    WHERE c.case_no IN ('P-001', 'P-018', 'P-024', 'P-030')
  ),
  'land_interests', (
    SELECT json_agg(json_build_object('parcel_ref', p.parcel_ref, 'party_ref', pt.party_ref, 'interest_type', li.interest_type))
    FROM public.land_interests li 
    JOIN public.parcels p ON li.parcel_id = p.id 
    JOIN public.parties pt ON li.party_id = pt.id 
    WHERE pt.party_ref = 'DEMO-PARTY-001'
  ),
  'demo_party', (
    SELECT json_agg(json_build_object('party_ref', party_ref, 'no_user', user_id IS NULL))
    FROM public.parties 
    WHERE party_ref = 'DEMO-PARTY-001'
  ),
  'rpc_exists', (
    SELECT count(*)
    FROM pg_proc 
    WHERE proname = 'bind_demo_party'
  ),
  'gis_rpc_test', (
    SELECT length(public.get_project_gis_data((SELECT id FROM public.projects WHERE project_code = 'DEMO-MH-001'))::text) > 100
  )
) as result;
