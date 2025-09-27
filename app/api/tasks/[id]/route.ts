// Arquivo: app/api/tasks/[id]/route.ts (VERSÃO CORRIGIDA)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Função para ATUALIZAR (PATCH) uma tarefa específica
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const { title, isCompleted } = await request.json();
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { title, isCompleted },
    });
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error("Erro ao atualizar tarefa: ", error);
    return new NextResponse('Erro interno ao atualizar tarefa.', { status: 500 });
  }
}

// Função para DELETAR (DELETE) uma tarefa específica
export async function DELETE(
  request: Request, // O request é necessário para a assinatura, mesmo que não seja usado
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (task?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }
    
    await prisma.task.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error("Erro ao deletar tarefa: ", error);
    return new NextResponse('Erro interno ao deletar tarefa.', { status: 500 });
  }
}