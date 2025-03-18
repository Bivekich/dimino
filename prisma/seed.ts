const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли уже администратор
  const adminExists = await prisma.user.findFirst({
    where: {
      role: 'ADMIN',
    },
  });

  if (adminExists) {
    console.log('Администратор уже существует, пропускаем создание');
    return;
  }

  // Создаем первого администратора
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dimino.ru',
      name: 'Администратор',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Создан администратор с email: ${admin.email}`);
  console.log('Пароль: admin123');
  console.log('Обязательно смените пароль после первого входа!');

  // Создаем тестовый город
  const city = await prisma.city.create({
    data: {
      name: 'Москва',
    },
  });

  console.log(`Создан тестовый город: ${city.name}`);

  // Создаем тестовый вид рыбы
  const fish = await prisma.fish.create({
    data: {
      name: 'Осетр',
    },
  });

  console.log(`Создан тестовый вид рыбы: ${fish.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
