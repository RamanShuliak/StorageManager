using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class MeasureProfile : Profile
{
    public MeasureProfile()
    {
        CreateMap<Measure, MeasureRsModel>()
          .ConstructUsing(src => new MeasureRsModel
          {
              Id = src.Id,
              Name = src.Name,
              IsArchived = src.IsArchived
          });
    }
}
