using Microsoft.EntityFrameworkCore;
using StorageManagerServer.Domain.Entities;

namespace StorageManagerServer.Dal;

public static class DataSeeder
{
    public static async Task<int> SeedDatabase(StorageDbContext dbContext)
    {
        var createdDate = DateTime.UtcNow;

        if(!await dbContext.Resources.AnyAsync())
        {
            var resources = new List<Resource>()
            {
                new Resource()
                {
                    Id = Guid.NewGuid(),
                    Name = "Ноутбук",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Resource()
                {
                    Id = Guid.NewGuid(),
                    Name = "Гель для душа",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Resource()
                {
                    Id = Guid.NewGuid(),
                    Name = "Гвозди",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Resource()
                {
                    Id = Guid.NewGuid(),
                    Name = "Апельсины",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
            };

            await dbContext.Resources.AddRangeAsync(resources);
        }

        if (!await dbContext.Measures.AnyAsync())
        {
            var measures = new List<Measure>()
            {
                new Measure()
                {
                    Id= Guid.NewGuid(),
                    Name = "шт",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Measure()
                {
                    Id= Guid.NewGuid(),
                    Name = "бутль",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Measure()
                {
                    Id= Guid.NewGuid(),
                    Name = "кг",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Measure()
                {
                    Id= Guid.NewGuid(),
                    Name = "ящик",
                    IsArchived = false,
                    CreatedDate = createdDate
                }
            };

            await dbContext.Measures.AddRangeAsync(measures);
        }

        if (!await dbContext.Clients.AnyAsync())
        {
            var clients = new List<Client>()
            {
                new Client()
                {
                    Id = Guid.NewGuid(),
                    Name = "ОАО Софтнет",
                    Address = "г.Москва, ул.Странная, д.56, пом.17",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Client()
                {
                    Id = Guid.NewGuid(),
                    Name = "ИП Мария Захарова",
                    Address = "г.Минск, ул.Ещё более странная, д.14",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Client()
                {
                    Id = Guid.NewGuid(),
                    Name = "Eregon corp.",
                    Address = "г.Слоним, ул.Яблочная, д.103, корп.2, пом.43",
                    IsArchived = false,
                    CreatedDate = createdDate
                },
                new Client()
                {
                    Id = Guid.NewGuid(),
                    Name = "ЗАО Fruit empire",
                    Address = "г.Неттакого, ул.Неттакой, д.1, пом.1",
                    IsArchived = false,
                    CreatedDate = createdDate
                }
            };

            await dbContext.Clients.AddRangeAsync(clients);
        }

        return await dbContext.SaveChangesAsync();
    }
}
