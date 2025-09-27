// Arquivo: app/api/tasks/[id]/route.ts (A CORREÇÃO FINAL)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Assinatura de função para PATCH
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } } // MUDANÇA CRÍTICA: Esta é a forma correta de tipar
) {
  try {
    const { id } = context.params; // Pegamos o 'id' a partir do 'context'
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { title, isCompleted } = await req.json();
    const task = await db.task.findUnique({ where: { id: id } });

    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const updatedTask = await db.task.update({
      where: { id: id },
      data: { title, isCompleted },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[TASK_ID_PATCH]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

// Assinatura de função para DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } // MUDANÇA CRÍTICA: Esta é a forma correta de tipar
) {
  try {
    const { id } = context.params; // Pegamos o 'id' a partir do 'context'
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: id } });

    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    await db.task.delete({ where: { id: id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TASK_ID_DELETE]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}