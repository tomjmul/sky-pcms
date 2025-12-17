/* Find in feed message */
SELECT * FROM
    (
    SELECT
        M.message -> 'localizableInformation' -> 0->> 'titleNameMedium' AS 	title,
				M.message -> 'localizableInformation' -> 0->> 'language' AS	language,
				M.message ->> 'contentId' contentId,
				M.message ->> 'providerId' providerId,
				M.message ->> 'providerVariantId' providerVariantId,
        M.message ->> 'contentSegments' contentSegments,
        M.message ->> 'programmeUuid' programmeUuid,
        M.message ->> 'providerSeriesId' providerSeriesId,
        M.message ->> 'providerSeasonId' providerSeasonId,
        M.message ->> 'accessChannel' accessChannel
    FROM
        (
        SELECT
            jsonb_array_elements ( feedmessage.message -> 'updateEntities' ) AS message
        FROM
            ( SELECT * FROM CONTENT.feedmessage ) AS feedmessage
        ) AS M
    ) AS res
WHERE
    res.providerId = '7105001527376402105' and res.language = 'spa';
