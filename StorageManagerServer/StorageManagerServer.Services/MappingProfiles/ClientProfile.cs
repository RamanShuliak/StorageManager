using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class ClientProfile : Profile
{
    public ClientProfile()
    {
        CreateMap<CreateClientRqModel, Client>()
          .ConstructUsing(src => new Client
          {
              Id = Guid.NewGuid(),
              Name = src.Name,
              Address = src.Address,
              IsArchived = false,
              CreatedDate = DateTime.UtcNow
          });

        CreateMap<Client, ClientRsModel>()
          .ConstructUsing(src => new ClientRsModel
          {
              Id = src.Id,
              Name = src.Name,
              Address = src.Address,
              IsArchived = src.IsArchived
          });
    }
}
