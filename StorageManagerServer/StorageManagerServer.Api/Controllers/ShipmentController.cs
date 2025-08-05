using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services.BllServices;

namespace StorageManagerServer.Api.Controllers;

[Route("api/shipment")]
[ApiController]
public class ShipmentController(
    IShipmentService _shipmentService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateDocumentAsync(
        CreateShipmentDocumentRqModel rqModel)
    {
        var result = await _shipmentService.CreateDocumentAsync(rqModel);

        return Ok(result);
    }

    [HttpGet("get-number-list")]
    public async Task<IActionResult> GetDocumentNumberListByParamsAsync()
    {
        var numberList = await _shipmentService.GetDocumentNumberListAsync();

        return Ok(numberList);
    }

    [HttpGet("get-list")]
    public async Task<IActionResult> GetDocumentListByParamsAsync(
        [FromQuery] GetDocumentListByParamsRqModel rqModel)
    {
        var rsModellist = await _shipmentService.GetDocumentListByParamsAsync(rqModel);

        return Ok(rsModellist);
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetDocumentByIdAsync(Guid id)
    {
        var rsModel = await _shipmentService.GetDocumentByIdAsync(id);

        return Ok(rsModel);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateDocumentAsync(UpdateShipmentDocumentRqModel rqModel)
    {
        var result = await _shipmentService.UpdateDocumentAsync(rqModel);

        return Ok(result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteDocumentByIdAsync(Guid documentId)
    {
        var result = await _shipmentService.DeleteDocumentByIdAsync(documentId);

        return Ok(result);
    }
}
