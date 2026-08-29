import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const email = 'admin@paroquiasf.com';
    const senha = 'ParoquiaSaoFidelis#2026';
    const existente = await prisma.admin.findUnique({ where: { email } });
    if (existente) {
        console.log('Admin já existe, nada a fazer.');
        return;
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const admin = await prisma.admin.create({
        data: {
            nome: 'ADM',
            email,
            senhaHash,
        },
    });
    console.log('Admin criado:', admin.email);
    console.log('Senha inicial (troque depois):', senha);
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map