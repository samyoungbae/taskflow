// Arquivo: app/api/tasks/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// As funções PATCH e DELETE agora verificam a propriedade da tarefa
async function checkTaskOwnership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  return task?.userId === userId;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const isOwner = await checkTaskOwnership(params.id, session.user.id);
  if (!isOwner) {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  const { title, isCompleted } = await request.json();
  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data: { title, isCompleted },
  });
  return NextResponse.json(updatedTask);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }
  
  const isOwner = await checkTaskOwnership(params.id, session.user.id);
  if (!isOwner) {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  await prisma.task.delete({
    where: { id: params.id },
  });
  return new NextResponse(null, { status: 204 });
}