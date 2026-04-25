import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">SampleShop</h1>
          <Badge variant="secondary">UI基盤構築中</Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">商品 {i}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  商品の説明テキストがここに入ります。
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">¥{i * 1000}</span>
                  <Button size="sm">カートに追加</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

