using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class ShipmentProfile : Profile
{
    public ShipmentProfile()
    {
        CreateMap<CreateShipmentResourceRqModel, ShipmentResource>()
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedDate,
                       opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.Amount,
                       opt => opt.MapFrom(src => src.Amount))
            .ForMember(dest => dest.ResourceId,
                       opt => opt.MapFrom(src => src.ResourceId))
            .ForMember(dest => dest.MeasureId,
                       opt => opt.MapFrom(src => src.MeasureId));

        CreateMap<CreateShipmentDocumentRqModel, ShipmentDocument>()
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.Number,
                       opt => opt.MapFrom(src => src.Number))
            .ForMember(dest => dest.ShipmentDate,
                       opt => opt.MapFrom(src => src.ShipmentDate))
            .ForMember(dest => dest.IsSigned,
                       opt => opt.MapFrom(_ => false))
            .ForMember(dest => dest.ClientId,
                       opt => opt.MapFrom(src => src.ClientId))
            .ForMember(dest => dest.CreatedDate,
                       opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.ShipmentResources,
                       opt => opt.MapFrom(src => src.Resources))
            .AfterMap((src, dest) =>
            {
                foreach (var resource in dest.ShipmentResources)
                {
                    resource.DocumentId = dest.Id;
                    resource.Document = dest;
                }
            });
    }
}
