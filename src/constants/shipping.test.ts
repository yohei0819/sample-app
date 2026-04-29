import { describe, expect, it } from 'vitest'
import { CARRIER_LABEL, getTrackingUrl, isCarrierCode } from './shipping'

describe('shipping 定数', () => {
  describe('isCarrierCode', () => {
    it('既知のコードは true', () => {
      expect(isCarrierCode('yamato')).toBe(true)
      expect(isCarrierCode('sagawa')).toBe(true)
      expect(isCarrierCode('japanpost')).toBe(true)
    })
    it('未知の値は false', () => {
      expect(isCarrierCode('unknown')).toBe(false)
      expect(isCarrierCode(null)).toBe(false)
      expect(isCarrierCode(undefined)).toBe(false)
      expect(isCarrierCode(123)).toBe(false)
    })
  })

  describe('getTrackingUrl', () => {
    it('未指定の場合は null', () => {
      expect(getTrackingUrl(null, null)).toBeNull()
      expect(getTrackingUrl('yamato', null)).toBeNull()
      expect(getTrackingUrl(null, '1234')).toBeNull()
    })
    it('未知のキャリアは null', () => {
      expect(getTrackingUrl('foo', '1234')).toBeNull()
    })
    it('既知のキャリアは URL を返す（追跡番号がエンコードされる）', () => {
      const url = getTrackingUrl('yamato', '1234-5678')
      expect(url).toContain('kuronekoyamato')
      expect(url).toContain('1234-5678')
    })
  })

  it('CARRIER_LABEL が全コードに存在する', () => {
    expect(CARRIER_LABEL.yamato).toBeTruthy()
    expect(CARRIER_LABEL.sagawa).toBeTruthy()
    expect(CARRIER_LABEL.japanpost).toBeTruthy()
  })
})
