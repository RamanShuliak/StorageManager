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
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.Name,
                       opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Address,
                       opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.IsArchived,
                       opt => opt.MapFrom(_ => false))
            .ForMember(dest => dest.CreatedDate,
                       opt => opt.MapFrom(_ => DateTime.UtcNow));

        CreateMap<Client, ClientRsModel>()
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name,
                       opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Address,
                       opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.IsArchived,
                       opt => opt.MapFrom(src => src.IsArchived));
    }
}

