delete from clientsyncqueue;
delete from publishjobitem;
delete from publishjob;
delete from events_listener_queue;
delete from events_queue;
delete from syndicationlog;





INSERT INTO "content"."syndication"("id", "code", "name", "masterpid", "contentsourcepid") VALUES ('e7f844b4-79ea-11e8-9643-739b1a19b309', 'SYNDICATE1', 'NOWTV GB & IE', '37f5541e-a299-11eb-a164-cf092ccee5ec', 'ff4850d0-a298-11eb-a164-5f41d49117f9');


INSERT INTO "content"."syndication_target"("syndicationid", "targetpid") VALUES ('e7f844b4-79ea-11e8-9643-739b1a19b309', 'ff4850d0-a298-11eb-a164-5f41d49117f9');
INSERT INTO "content"."syndication_target"("syndicationid", "targetpid") VALUES ('e7f844b4-79ea-11e8-9643-739b1a19b309', 'caaf335c-a298-11eb-a164-9f8c0a9e04a9');




select nst.type, nst.subtype, nst.category, version_nci.nodeid as version_nodeid, version_nci.collection, ext.nodeid, ext.source, ext.extref,version_nci.rank
            from content.nodecollectionitem version_nci
            join content.externalid ext  on ext.nodeid = version_nci.memberid
						join content.nodesubtype nst on nst.type=version_nci.itemtype and nst.subtype=version_nci.itemsubtype and coalesce(nst.category, '')=coalesce(version_nci.itemcategory, '')
            where version_nci.nodeid = '7d64c254-a29a-11eb-94f8-a71f57b08bac'
            and ext.source in ('CONTENT_ID', 'PROVIDER_SERIES_ID', 'PROVIDER_SEASON_ID', 'LINEAR_EVENT_ID')
            and version_nci.collection = 'items'
            group by version_nci.nodeid, ext.nodeid, ext.source, ext.extref,version_nci.rank, version_nci.collection, nst.type, nst.subtype, nst.category
            order by version_nci.nodeid,version_nci.rank
