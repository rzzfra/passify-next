import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function NotFound() { return <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4 font-vazir"><Card className="max-w-sm text-center"><CardContent><h1 className="text-xl font-black text-slate-100">صفحه پیدا نشد</h1><p className="my-4 text-sm text-slate-400">آدرس موردنظر وجود ندارد.</p><Button asChild><Link href="/">بازگشت به فروشگاه</Link></Button></CardContent></Card></main>; }
