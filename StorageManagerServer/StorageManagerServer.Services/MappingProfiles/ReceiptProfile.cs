using AutoMapper;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;

namespace StorageManagerServer.Services.MappingProfiles;

public class ReceiptProfile : Profile
{
    public ReceiptProfile()
    {
        CreateMap<CreateReceiptResourceRqModel, ReceiptResource>()
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

        CreateMap<CreateReceiptDocumentRqModel, ReceiptDocument>()
            .ForMember(dest => dest.Id,
                       opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(dest => dest.Number,
                       opt => opt.MapFrom(src => src.Number))
            .ForMember(dest => dest.ReceiptDate,
                       opt => opt.MapFrom(src => src.ReceiptDate))
            .ForMember(dest => dest.CreatedDate,
                       opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.ReceiptResources,
                       opt => opt.MapFrom(src => src.Resources))
            .AfterMap((src, dest) =>
            {
                foreach (var resource in dest.ReceiptResources)
                {
                    resource.DocumentId = dest.Id;
                    resource.Document = dest;
                }
            });
    }
}
