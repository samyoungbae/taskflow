// Arquivo: app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
// Importaremos nossas opções de configuração do NextAuth
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Função GET MODIFICADA para ser ciente do usuário
export async function GET() {
  // Pega a sessão do usuário do lado do servidor
  const session = await getServerSession(authOptions);

  // Se não houver sessão (usuário não logado), retorna erro de não autorizado
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  // Busca apenas as tarefas que pertencem ao usuário logado
  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}

// Função POST MODIFICADA para associar a tarefa ao usuário
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const { title } = await request.json();
  if (!title) {
    return new NextResponse('O título é obrigatório.', { status: 400 });
  }

  // Cria a nova tarefa associando-a ao ID do usuário da sessão
  const newTask = await prisma.task.create({
    data: {
      title: title,
      userId: session.user.id, // AQUI está a mágica!
    },
  });

  return NextResponse.json(newTask, { status: 201 });
}