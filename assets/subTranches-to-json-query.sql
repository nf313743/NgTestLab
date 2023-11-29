declare @TradeId INT = 753438


SET NOCOUNT ON;

DROP TABLE IF EXISTS #PricedLots
CREATE TABLE #PricedLots
(
    TransactionId INT NOT NULL
    , MatchCode INT NOT NULL
    , Tranche INT NULL
    , SubTranche INT NULL
    , Lots DECIMAL (18, 4) NOT NULL
    , FuturePrice DECIMAL (18, 6) NOT NULL
    , CcyMultiplier DECIMAL (18, 6) NOT NULL
    , FuturePriceMT DECIMAL (18, 6) NOT NULL
    , PriceUnit VARCHAR (8) NULL
    , FuturesPriceWithOffset DECIMAL (18, 6) NOT NULL
    , AttributionId INT NOT NULL
    , TradeId INT NOT NULL
    , FutureId INT NOT NULL
    , AttClassId INT NOT NULL
)

INSERT INTO #PricedLots
EXEC [derivatives].[AttributedFutures] @TradeId

-- Only want Client Attributions
DELETE FROM #PricedLots WHERE AttClassId <> 1


DROP TABLE IF EXISTS #Wap
SELECT
    MatchCode
    , Tranche
    , SubTranche 
    , Wap = CASE WHEN SUM(Lots) = 0 THEN SUM(FuturePriceMT) ELSE SUM(Lots * FuturePriceMT) / SUM(Lots) END
    , Lots = SUM(Lots)
INTO #Wap
FROM #PricedLots
GROUP BY
     MatchCode
    , Tranche
     , SubTranche


-- MAIN SUB-TRANCHE DATA
DROP TABLE IF EXISTS #SubTrancheData
SELECT 
    id = pp.PhysicalPositionId
    , trancheNum = pp.Tranche
    , subTrancheNum = pp.SubTranche
    , subTrancheChar = pp.SubTrancheChar
    , begTime = pp.begTime
    , endTime = pp.endtime
    , hedgeMonth = ISNULL(tp.timeperiod, '')
    , quantity = pp.quantity
    , pricedLots =  0 --ISNULL(#Wap.Lots, 0)
    , unpricedLots = pp.Lots --COALESCE(pp.Lots - #Wap.Lots, pp.Lots, 0)
    , wap = 0--ISNULL(#Wap.Wap, 0)
    , futuresPremium = ABS(ABS(pp.FuturesExecutionLevel) - ABS(pp.ClientFuturesExecutionLevel))
    , clientFuturesExecutionLevel = 0 --pp.ClientFuturesExecutionLevel
    , PricedPols = ISNULL(#Wap.Lots, 0)  -- This is very likey wrong.  Awaiting feedback
    , UnpricedPols = ISNULL(pp.Lots - #Wap.Wap, 0)
    , PolsLevel = CASE
                        WHEN ISNULL(pp.PolsLots, 0) = 0 THEN 0
                        ELSE ISNULL(pp.PolsLots * pp.fixedprice / pp.PolsLots, 0)
                    END
    , PolsScale = ps.Name
    , AvailableTonnage = ISNULL(cf.AvailableTonnage, 0)
    , contractualDifference = tp.PriceDiff
    , invoicePrice = 0 -- pp.InvoicePrice
INTO #SubTrancheData
FROM
    [dbo].[physicalposition] pp
    INNER JOIN [dbo].[position] pos ON pos.trade = pp.trade
    INNER JOIN [dbo].[tradeprice] tp ON pp.PhysicalPositionId = tp.PhysicalPositionId
    LEFT JOIN #Wap ON #Wap.MatchCode = pp.trade AND #Wap.Tranche = pp.Tranche AND #Wap.SubTranche = pp.SubTranche
    LEFT JOIN [dbo].[Ops_PolsScale] ps ON ps.polsScaleId = pos.PolsScaleId
    LEFT JOIN [physicaltrading].[vwCallForwardAvailableTonnageLite] cf ON cf.PhysicalPositionId = pp.PhysicalPositionId
WHERE 
    pp.trade = @TradeId
        AND pp.quantity <> 0 


SELECT * FROM #SubTrancheData
order by
    trancheNum,
    subTrancheNum


