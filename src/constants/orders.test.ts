// 注文ステータス遷移ロジックのユニットテスト
import { describe, expect, it } from 'vitest'
import type { OrderStatus } from '@/generated/prisma/client'
import { ORDER_STATUS_TRANSITIONS, canTransitionOrderStatus } from './orders'

describe('canTransitionOrderStatus', () => {
  describe('PENDING からの遷移', () => {
    it('PAID への遷移を許可する', () => {
      expect(canTransitionOrderStatus('PENDING', 'PAID')).toBe(true)
    })

    it('CANCELLED への遷移を許可する', () => {
      expect(canTransitionOrderStatus('PENDING', 'CANCELLED')).toBe(true)
    })

    it('SHIPPED への直接遷移を拒否する', () => {
      expect(canTransitionOrderStatus('PENDING', 'SHIPPED')).toBe(false)
    })

    it('DELIVERED への直接遷移を拒否する', () => {
      expect(canTransitionOrderStatus('PENDING', 'DELIVERED')).toBe(false)
    })

    it('同一ステータス（PENDING）への遷移を拒否する', () => {
      expect(canTransitionOrderStatus('PENDING', 'PENDING')).toBe(false)
    })
  })

  describe('PAID からの遷移', () => {
    it('SHIPPED への遷移を許可する', () => {
      expect(canTransitionOrderStatus('PAID', 'SHIPPED')).toBe(true)
    })

    it('CANCELLED への遷移を許可する', () => {
      expect(canTransitionOrderStatus('PAID', 'CANCELLED')).toBe(true)
    })

    it('PENDING への巻き戻しを拒否する', () => {
      expect(canTransitionOrderStatus('PAID', 'PENDING')).toBe(false)
    })

    it('DELIVERED への直接遷移を拒否する', () => {
      expect(canTransitionOrderStatus('PAID', 'DELIVERED')).toBe(false)
    })
  })

  describe('SHIPPED からの遷移', () => {
    it('DELIVERED への遷移を許可する', () => {
      expect(canTransitionOrderStatus('SHIPPED', 'DELIVERED')).toBe(true)
    })

    it('CANCELLED への遷移を許可する', () => {
      expect(canTransitionOrderStatus('SHIPPED', 'CANCELLED')).toBe(true)
    })

    it('PENDING への巻き戻しを拒否する', () => {
      expect(canTransitionOrderStatus('SHIPPED', 'PENDING')).toBe(false)
    })

    it('PAID への巻き戻しを拒否する', () => {
      expect(canTransitionOrderStatus('SHIPPED', 'PAID')).toBe(false)
    })
  })

  describe('DELIVERED は終端状態', () => {
    const targets: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    it.each(targets)('DELIVERED から %s への遷移を全て拒否する', (to) => {
      expect(canTransitionOrderStatus('DELIVERED', to)).toBe(false)
    })

    it('遷移可能リストが空配列である', () => {
      expect(ORDER_STATUS_TRANSITIONS.DELIVERED).toEqual([])
    })
  })

  describe('CANCELLED は終端状態', () => {
    const targets: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    it.each(targets)('CANCELLED から %s への遷移を全て拒否する', (to) => {
      expect(canTransitionOrderStatus('CANCELLED', to)).toBe(false)
    })

    it('遷移可能リストが空配列である', () => {
      expect(ORDER_STATUS_TRANSITIONS.CANCELLED).toEqual([])
    })
  })
})
