using AutoMapper;
using StorageManagerServer.Dal.Repositories;
using StorageManagerServer.Domain.Entities;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Domain.Models.RsModels;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Services.BllServices;

public interface IMeasureService
{
    Task<MeasureRsModel> CreateMeasureAsync(string measureName);
    Task<MeasureRsModel> GetMeasureByIdAsync(Guid id);
    Task<List<MeasureRsModel>> GetActiveMeasuresAsync();
    Task<List<MeasureRsModel>> GetArchivedMeasuresAsync();
    Task<MeasureRsModel> UpdateMeasureAsync(UpdateMeasureRqModel rqModel);
    Task<int> UpdateMeasureStateByIdAsync(Guid id);
    Task<int> DeleteMeasureByIdAsync(Guid id);
}

public class MeasureService(
    IUnitOfWork _uoW,
    IMapper _mapper) : IMeasureService
{
    public async Task<MeasureRsModel> CreateMeasureAsync(string measureName)
    {
        var isMeasureExist = await _uoW.Measures.IsMeasureExistByNameAsync(measureName);

        if (isMeasureExist)
        {
            throw new EntityAlreadyExistsException($"Measure with Name = {measureName} is already exist");
        }

        var measure = new Measure()
        {
            Id = Guid.NewGuid(),
            Name = measureName,
            IsArchived = false,
            CreatedDate = DateTime.UtcNow
        };

        var result = await _uoW.Measures.CreateMeasureAsync(measure);

        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<MeasureRsModel>(measure);

        return rsModel;
    }

    public async Task<MeasureRsModel> GetMeasureByIdAsync(Guid id)
    {
        var measure = await _uoW.Measures.GetMeasureByIdAsync(id);

        if (measure == null)
        {
            throw new EntityNotFoundException($"There is no Measure with Id = {id} ib data base");
        }

        var rsModel = _mapper.Map<MeasureRsModel>(measure);

        return rsModel;
    }

    public async Task<List<MeasureRsModel>> GetActiveMeasuresAsync()
    {
        var measures = await _uoW.Measures.GetActiveMeasuresAsync();

        var activeMeasures = new List<MeasureRsModel>();

        foreach (var measure in measures)
        {
            var rsModel = _mapper.Map<MeasureRsModel>(measure);
            activeMeasures.Add(rsModel);
        }

        return activeMeasures;
    }

    public async Task<List<MeasureRsModel>> GetArchivedMeasuresAsync()
    {
        var measures = await _uoW.Measures.GetArchivedMeasuresAsync();

        var activeMeasures = new List<MeasureRsModel>();

        foreach (var measure in measures)
        {
            var rsModel = _mapper.Map<MeasureRsModel>(measure);
            activeMeasures.Add(rsModel);
        }

        return activeMeasures;
    }

    public async Task<MeasureRsModel> UpdateMeasureAsync(UpdateMeasureRqModel rqModel)
    {
        var measure = await _uoW.Measures.GetMeasureByIdAsync(rqModel.Id);

        if (measure == null)
        {
            throw new EntityNotFoundException($"There is no Measure with Id = {rqModel.Id} in data base");
        }

        measure.Name = rqModel.Name;
        measure.UpdatedDate = DateTime.UtcNow;

        _uoW.Measures.UpdateMeasure(measure);
        await _uoW.SaveChangesAsync();

        var rsModel = _mapper.Map<MeasureRsModel>(measure);

        return rsModel;
    }

    public async Task<int> UpdateMeasureStateByIdAsync(Guid id)
    {
        var measure = await _uoW.Measures.GetMeasureByIdAsync(id);

        if (measure == null)
        {
            throw new EntityNotFoundException($"There is no Measure with Id = {id} in data base");
        }

        if (measure.IsArchived)
        {
            measure.IsArchived = false;
        }
        else
        {
            measure.IsArchived = true;
        }

        measure.UpdatedDate = DateTime.UtcNow;

        _uoW.Measures.UpdateMeasure(measure);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }

    public async Task<int> DeleteMeasureByIdAsync(Guid id)
    {
        var measure = await _uoW.Measures.GetMeasureByIdAsync(id);

        if (measure == null)
        {
            throw new EntityNotFoundException($"There is no Measure with Id = {id} in data base");
        }

        var isHasIncludes = await _uoW.Measures.IsMeasureHasIncludesByIdAsync(id);

        if (isHasIncludes)
        {
            throw new EntityHasIncludesException($"Measure with Id = {id} is used in the system");
        }

        _uoW.Measures.DeleteMeasure(measure);
        var result = await _uoW.SaveChangesAsync();

        return result;
    }
}
