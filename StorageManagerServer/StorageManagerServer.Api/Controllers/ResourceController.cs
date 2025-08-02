using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.Exceptions;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/resource")]
[ApiController]
public class ResourceController(
    IResourceService _resourceService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateResourceAsync(string resourceName)
    {
        var rsModel = await _resourceService.CreateResourceAsync(resourceName);

        return Ok(rsModel);
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetResourceByIdAsync(Guid id)
    {
        var rsModel = await _resourceService.GetResourceByIdAsync(id);

        return Ok(rsModel);
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveResourcesAsync()
    {
        var rsModelList = await _resourceService.GetActiveResourcesAsync();

        return Ok(rsModelList);
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedResourcesAsync()
    {
        var rsModelList = await _resourceService.GetArchivedResourcesAsync();

        return Ok(rsModelList);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateResourceAsync(UpdateResourceRqModel rqModel)
    {
        var rsModel = await _resourceService.UpdateResourceAsync(rqModel);

        return Ok(rsModel);
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateResourceStateByIdAsync(Guid id)
    {
        var result = await _resourceService.UpdateResourceStateByIdAsync(id);

        return Ok(result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteResourceByIdAsync(Guid id)
    {
        var result = await _resourceService.DeleteResourceByIdAsync(id);

        return Ok(result);
    }
}
