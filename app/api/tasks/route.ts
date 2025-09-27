// Arquivo: app/api/tasks/route.ts (CORREÇÃO FINAL)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // <-- AQUI ESTÁ A CORREÇÃO
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { title } = await req.json();
    if (!title) {
      return new NextResponse('Título é obrigatório', { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}