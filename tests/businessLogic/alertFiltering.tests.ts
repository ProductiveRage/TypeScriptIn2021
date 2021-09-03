import { List } from 'immutable'
import Stock from '../../src/state/stock'
import getStocksToAlertAbout from '../../src/businessLogic/alertFiltering'

const getStockFromBidAndOpen = (symbol: string, bid: number, open: number) => {
  return new Stock(symbol, bid, 1, 100, open, 0, new Date(1630668766543))
}

describe('AlertFiltering', () => {
  describe('getStocksToAlertAbout', () => {
    it('should return message if no selected stocks', () => {
      const stocks = List<Stock>()
      expect(getStocksToAlertAbout(stocks)).toBeInstanceOf(String)
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return message if no selected stock has no alert threshold', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 100, 1).withPriceDeviationPercentageForAlert(0)
      ])
      expect(getStocksToAlertAbout(stocks)).toBeInstanceOf(String)
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return message if no selected stock increased but insufficient for threshold', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 1.5, 1).withPriceDeviationPercentageForAlert(100)
      ])
      expect(getStocksToAlertAbout(stocks)).toBeInstanceOf(String)
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return stock if bid increased by the minimium amount required', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 2, 1).withPriceDeviationPercentageForAlert(100)
      ])
      const result = getStocksToAlertAbout(stocks)
      expect(result).toBeInstanceOf(List)
      const resultArray = (<any>result).toArray()
      expect(resultArray).toHaveSize(1)
      expect(resultArray[0].stock).toEqual(stocks.get(0))
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return stock if bid increased more than the minimium amount required', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 2.1, 1).withPriceDeviationPercentageForAlert(100)

      ])
      const result = getStocksToAlertAbout(stocks)
      expect(result).toBeInstanceOf(List)
      const resultArray = (<any>result).toArray()
      expect(resultArray).toHaveSize(1)
      expect(resultArray[0].stock).toEqual(stocks.get(0))
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return stock if bid decreased by the minimium amount required', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 0.5, 1).withPriceDeviationPercentageForAlert(-50) // TODO
      ])
      const result = getStocksToAlertAbout(stocks)
      expect(result).toBeInstanceOf(List)
      const resultArray = (<any>result).toArray()
      expect(resultArray).toHaveSize(1)
      expect(resultArray[0].stock).toEqual(stocks.get(0))
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return stock if bid decreased more than the minimium amount required', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 0.1, 1).withPriceDeviationPercentageForAlert(-50)

      ])
      const result = getStocksToAlertAbout(stocks)
      expect(result).toBeInstanceOf(List)
      const resultArray = (<any>result).toArray()
      expect(resultArray).toHaveSize(1)
      expect(resultArray[0].stock).toEqual(stocks.get(0))
    })
  })

  describe('getStocksToAlertAbout', () => {
    it('should return only one of two stocks if only one increased beyonds its alert threshold', () => {
      const stocks = List<Stock>([
        getStockFromBidAndOpen('TEST1', 2.1, 1).withPriceDeviationPercentageForAlert(500),
        getStockFromBidAndOpen('TEST2', 2.1, 1).withPriceDeviationPercentageForAlert(100)
      ])
      const result = getStocksToAlertAbout(stocks)
      expect(result).toBeInstanceOf(List)
      const resultArray = (<any>result).toArray()
      expect(resultArray).toHaveSize(1)
      expect(resultArray[0].stock).toEqual(stocks.get(1))
    })
  })
})
