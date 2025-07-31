using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class ResourceProfile : Profile
{
    public ResourceProfile()
    {
        CreateMap<Resource, ResourceRsModel>()
          .ConstructUsing(src => new ResourceRsModel
          {
              Id = src.Id,
              Name = src.Name,
              IsArchived = src.IsArchived
          });
    }
}
