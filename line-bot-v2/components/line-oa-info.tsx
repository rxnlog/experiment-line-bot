'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, QrCode, ExternalLink, ArrowUp, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LineOfficialInfo() {
    const lineId = '@171ajgxt';
    const addUrl = 'https://line.me/R/ti/p/@171ajgxt';
    const qrCodeUrl = 'https://qr-official.line.me/gs/M_171ajgxt_GW.png?oat_content=qr';

    return (
        <div className="flex flex-col items-center justify-start p-8 text-center space-y-6 animate-in fade-in duration-500 min-h-full relative overflow-y-auto w-full">
            {/* Helper Section - Top Most for both Mobile & Desktop */}
            <div className="w-full flex flex-col items-center pt-4">
                {/* Visual Guide for Mobile (Top) */}
                <div className="md:hidden flex flex-col items-center gap-2 animate-bounce text-primary">
                    <ArrowUp className="w-6 h-6" />
                    <span className="text-sm font-bold">เลือกการสนทนาที่ด้านบนเพื่อเริ่มแชท</span>
                </div>

                {/* Visual Guide for Desktop (Above Content) */}
                <div className="hidden md:flex flex-col items-center gap-2 animate-pulse text-primary">
                    <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full border border-primary/20 shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold whitespace-nowrap">เลือกการสนทนาจากแถบด้านข้าง</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">ผู้ช่วยอัจฉริยะ</h1>
                <p className="max-w-[600px] text-muted-foreground mx-auto underline decoration-primary/30 underline-offset-4 px-4 text-sm md:text-base">
                    จัดการบทสนทนาและตั้งค่าการตอบกลับอัตโนมัติด้วย AI ของคุณอย่างง่ายดาย
                </p>
            </div>

            {/* Smaller Add Line Card */}
            <Card className="w-full max-w-[280px] overflow-hidden shadow-md border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="bg-primary/5 p-4 flex flex-col items-center space-y-3">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={qrCodeUrl}
                                alt="LINE Official Account QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">เพิ่มเพื่อนเพื่อเริ่มใช้งาน</p>
                            <div className="flex items-center justify-center gap-1.5 bg-background px-2 py-0.5 rounded-full border shadow-sm">
                                <span className="font-mono font-bold text-sm text-foreground">{lineId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <Button
                            className="w-full h-10 text-sm font-semibold gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                            asChild
                        >
                            <a href={addUrl} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-4 h-4 fill-current" />
                                เพิ่มเพื่อนใน LINE
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                        </Button>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            สแกนคิวอาร์โค้ดหรือคลิกปุ่มด้านบน
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
