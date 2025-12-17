SELECT * FROM (
select jsonb_array_elements ( dvs.values ) AS images, nodeid
        FROM (select dv.* from datagramvariant dv left join node_data n on n.id=dv.nodeid  WHERE dv.name='IMAGES' and n.subtype = 'EPISODE' ) as dvs ) as res
where images ->> 'type' = 'nonTitleArt34'

