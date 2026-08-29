import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../src/modules/categories/categories.service';
import { PrismaService } from '../src/database/prisma.service';

describe('CategoriesService (Catalog CRUD Tests)', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return nested hierarchical category tree', async () => {
    const mockTree = [
      {
        id: 'cat-1',
        name: 'Grocery',
        slug: 'grocery',
        parentId: null,
        children: [
          { id: 'cat-1-1', name: 'Fruits', slug: 'fruits', parentId: 'cat-1', children: [] },
        ],
      },
    ];

    mockPrisma.category.findMany.mockResolvedValue(mockTree);
    const result = await service.findAllTree();
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
  });

  it('should create new category', async () => {
    const newCat = { name: 'Dairy & Eggs', slug: 'dairy-eggs', parentId: 'cat-1' };
    mockPrisma.category.create.mockResolvedValue({ id: 'cat-2', ...newCat });

    const result = await service.create(newCat);
    expect(result.id).toBe('cat-2');
    expect(result.name).toBe('Dairy & Eggs');
  });
});
