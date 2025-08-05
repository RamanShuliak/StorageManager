using Microsoft.AspNetCore.Mvc;
using StorageManagerServer.Domain.Models.RqModels;
using StorageManagerServer.Services;
using StorageManagerServer.Services.BllServices;
using StorageManagerServer.Services.Exceptions;

namespace StorageManagerServer.Api.Controllers;

[Route("api/receipt")]
[ApiController]
public class ReceiptController(
    IReceiptService _receiptService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<IActionResult> CreateDocumentAsync(
        CreateReceiptDocumentRqModel rqModel)
    {
        var result = await _receiptService.CreateDocumentAsync(rqModel);

        return Ok(result);
    }

    [HttpGet("get-number-list")]
    public async Task<IActionResult> GetDocumentNumberListByParamsAsync()
    {
        var numberList = await _receiptService.GetDocumentNumberListAsync();

        return Ok(numberList);
    }

    [HttpGet("get-list")]
    public async Task<IActionResult> GetDocumentListByParamsAsync(
        [FromQuery]GetDocumentListByParamsRqModel rqModel)
    {
        var rsModellist = await _receiptService.GetDocumentListByParamsAsync(rqModel);

        return Ok(rsModellist);
    }

    [HttpGet("get")]
    public async Task<IActionResult> GetDocumentByIdAsync(Guid id)
    {
        var rsModel = await _receiptService.GetDocumentByIdAsync(id);

        return Ok(rsModel);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateDocumentAsync(UpdateReceiptDocumentRqModel rqModel)
    {
        var result = await _receiptService.UpdateDocumentAsync(rqModel);

        return Ok(result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteDocumentByIdAsync(Guid documentId)
    {
        var result = await _receiptService.DeleteDocumentByIdAsync(documentId);

        return Ok(result);
    }
}
