// Arquivo: app/api/tasks/[id]/route.ts (CORREÇÃO FINAL)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // <-- AQUI ESTÁ A CORREÇÃO
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { title, isCompleted } = await req.json();
    const task = await db.task.findUnique({
      where: {
        id: params.id,
      },
    });

    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const updatedTask = await db.task.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        isCompleted,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[TASK_ID_PATCH]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const task = await db.task.findUnique({
      where: {
        id: params.id,
      },
    });

    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    await db.task.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TASK_ID_DELETE]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}