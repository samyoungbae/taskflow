// Arquivo: app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // <--- IMPORTAÇÃO CORRIGIDA

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }
  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }
  const { title } = await request.json();
  if (!title) {
    return new NextResponse('O título é obrigatório.', { status: 400 });
  }
  const newTask = await prisma.task.create({
    data: {
      title: title,
      userId: session.user.id,
    },
  });
  return NextResponse.json(newTask, { status: 201 });
}