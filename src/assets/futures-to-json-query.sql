declare @MatchCode INT = 753438


DECLARE @MatchCodeLocal INT = (select @MatchCode)

;WITH TradeDetailCte
AS (
    SELECT
            TransactionId = trans.Id
            , AllocationId = details.AllocationId
            , CcyMultiplier = details.CcyMultiplier
            , CommodityNotional = ISNULL(-(details.Price * trans.Quantity * details.ConversionFactor), 0)
            , ContractType = details.ContractType
            , ContractTypeId = details.ContractTypeId
            , ExecutionType = details.ExecutionType
            , FuturesPriceWithOffset = details.FuturesPriceWithOffset
            , MatchCode = trans.MatchCode
            , Price = details.Price
            , Product = details.Product
            , ProductId = details.ProductId
            , Prompt = details.Prompt
            , Quantity = trans.Quantity
            , TradeDate = details.TradeDate
            , TradeStatus = details.TradeStatus
            , UnitMultiplier = details.UnitMultiplier
    FROM 
        [derivatives].[Transaction] trans
        CROSS APPLY
        (
            SELECT TOP 1 
                Product = Product.ShortText
                , CcyMultiplier = CASE WHEN pem.TradeCurrency = 'NYD' THEN 22.0462 ELSE 1 END
                , ContractType = ContractType.ShortText
                , ContractTypeId = ContractType.ID
                , ConversionFactor = pem.ConversionFactor
                , ExecutionType = ExecutionType.ShortText
                , Price =   ISNULL(CASE
                                WHEN ContractType.ID = 1 THEN Future.Price
                                WHEN ContractType.ID = 2 THEN [Option].Premium
                                WHEN ContractType.ID = 3 OR ContractType.ID = 4 OR ContractType.ID = 7 THEN ForeignExchange.Rate
                                WHEN ContractType.ID = 9 THEN AccumulatedForward.Strike
                            END, 0)
                , ProductId = Product.ID
                , Prompt = COALESCE(Future.Prompt, [Option].Prompt, AccumulatedForward.Prompt)
                , TradeDate = t.TradeDate
                , TradeStatus = TradeStatus.Name
                , UnitMultiplier =   CASE 
                                        WHEN (pem.TradeCurrency = 'NYD' AND pem.PriceUnit = 'LB') AND (physical.unit = 'MT' AND physical.currency = 'USD') THEN 22.0462 -- Physical USD/MT - Future c/lb
                                        ELSE 1 
                                    END
                , FuturesPriceWithOffset =  CASE 
                                                WHEN absOffset.FutureId IS NOT NULL THEN Future.Price * (1 + absOffset.[Value] / 100)
                                                WHEN percentOffset.FutureId IS NOT NULL THEN  Future.Price + percentOffset.[Value]
                                                ELSE ISNULL(Future.Price, 0)
                                            END
                , alloc.AllocationId
            FROM [derivatives].Trade_ t
                INNER JOIN derivatives.TradeTransactionAllocationItem alloc ON alloc.TradeId = t.TradeId
                INNER JOIN [derivatives].ContractType ON ContractType.ID = t.ContractType
                INNER JOIN [derivatives].ExecutionType ON ExecutionType.ID = t.ExecutionType
                INNER JOIN [derivatives].Product ON Product.ID = t.ProductId
                INNER JOIN [derivatives].TradeStatus ON TradeStatus.Id = t.[Status]
                INNER JOIN [dbo].PhysicalPosition physical on physical.trade = trans.MatchCode
                LEFT JOIN [derivatives].Future ON t.TradeId = Future.TradeId
                LEFT JOIN [derivatives].[Option] ON [Option].TradeId = t.TradeId
                LEFT JOIN [derivatives].AccumulatedForward ON AccumulatedForward.TradeId = t.TradeId
                LEFT JOIN [derivatives].Option_Exotics ON Option_Exotics.OptionId = [Option].OptionId
                LEFT JOIN [derivatives].ForeignExchange ON ForeignExchange.TradeId = t.TradeId
                LEFT JOIN [derivatives].Allegro_ProductExecutionMap pem ON pem.ProductID = t.ProductId
                    AND pem.ContractTypeID = t.ContractType
                    AND pem.ExecutionTypeID = t.ExecutionType
                LEFT JOIN derivatives.FuturePriceAbsoluteOffset absOffset ON absOffset.FutureId = Future.FutureId
                LEFT JOIN derivatives.FuturePricePercentageOffset percentOffset ON percentOffset.FutureId = Future.FutureId
            WHERE alloc.TransactionId = trans.Id
            
        ) details
    WHERE
        trans.MatchCode = @MatchCodeLocal
        AND trans.[Status] <> 9
)
SELECT
    id = TradeDetailCte.TransactionId
    , ccyMultiplier = TradeDetailCte.CcyMultiplier
    , tradeDate = TradeDetailCte.TradeDate
    , productType = TradeDetailCte.Product
    , prompt = convert(date, TradeDetailCte.Prompt)
    , lots = TradeDetailCte.Quantity
    , price = convert(decimal(8,3), TradeDetailCte.Price)
    , futuresPriceWithOffset = convert(decimal(8,3),TradeDetailCte.FuturesPriceWithOffset)
FROM TradeDetailCte 
    LEFT JOIN (
        SELECT 
            TransactionId = vwAttributionCurrent.TransactionId
            , ClassId = AttributeAccount.Id
            , Class = AttributeAccount.Title
            , AttributeId = AttributePurpose.Id
            , Attribute = AttributePurpose.Title
            , TradeTypeId = AttributeTradeType.Id
            , TradeType = AttributeTradeType.Title
            , Tranche = Attribution.Tranche
            , SubTranche = Attribution.SubTranche
            , SubTrancheId = pp.PhysicalPositionId
            , [Description] = Attribution.[Description]
            , Leg1 = Attribution.Leg1
            , Leg2 = Attribution.Leg2
        FROM 
            [derivatives].vwAttributionCurrent
            INNER JOIN [derivatives].Attribution ON Attribution.Id = vwAttributionCurrent.AttributionId
            INNER JOIN [derivatives].AttributeAccount ON AttributeAccount.Id = [derivatives].Attribution.AttributeAccountId
            INNER JOIN [derivatives].AttributePurpose ON AttributePurpose.Id = [derivatives].Attribution.AttributePurposeId
            INNER JOIN [derivatives].[Transaction] trans ON trans.Id = vwAttributionCurrent.TransactionId
            LEFT JOIN PhysicalPosition pp ON pp.Trade = trans.MatchCode AND pp.Tranche = Attribution.Tranche AND pp.SubTranche = Attribution.SubTranche
            LEFT JOIN [derivatives].AttributeTradeType ON AttributeTradeType.Id = [derivatives].Attribution.AttributeTradeTypeId
    ) DerivedAttribution on DerivedAttribution.TransactionId = [TradeDetailCte].TransactionId

WHERE
    TradeDetailCte.Prompt IS NOT NULL
    -- THUB-91 - Workaround that will exclude Fx's
ORDER BY 
    TradeDetailCte.TransactionId


