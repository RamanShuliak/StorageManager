using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RsModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class MeasureProfile : Profile
{
    public MeasureProfile()
    {
        CreateMap<Measure, MeasureRsModel>()
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name,
                       opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.IsArchived,
                       opt => opt.MapFrom(src => src.IsArchived));
    }
}

