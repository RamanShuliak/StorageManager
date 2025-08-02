using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/client")]
[ApiController]
public class ClientController(
    IClientService _clientService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateClientAsync(CreateClientRqModel rqModel)
    {
        var rsModel = await _clientService.CreateClientAsync(rqModel);

        return Ok(rsModel);
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetClientByIdAsync(Guid id)
    {
        var rsModel = await _clientService.GetClientByIdAsync(id);

        return Ok(rsModel);
    }

    [HttpGet("get-active")]
    public async Task<IActionResult> GetActiveClientsAsync()
    {
        var rsModelList = await _clientService.GetActiveClientsAsync();

        return Ok(rsModelList);
    }

    [HttpGet("get-archived")]
    public async Task<IActionResult> GetArchivedClientsAsync()
    {
        var rsModelList = await _clientService.GetArchivedClientsAsync();

        return Ok(rsModelList);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateClientAsync(UpdateClientRqModel rqModel)
    {
        var rsModel = await _clientService.UpdateClientAsync(rqModel);

        return Ok(rsModel);
    }

    [HttpPut("update-state")]
    public async Task<IActionResult> UpdateClientStateByIdAsync(Guid id)
    {
        var result = await _clientService.UpdateClientStateByIdAsync(id);

        return Ok(result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteClientByIdAsync(Guid id)
    {
        var result = await _clientService.DeleteClientByIdAsync(id);

        return Ok(result);
    }
}
