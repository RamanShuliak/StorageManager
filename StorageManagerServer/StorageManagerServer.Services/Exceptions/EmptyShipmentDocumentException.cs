namespace StorageManagerServer.Services.Exceptions;

public class EmptyShipmentDocumentException : Exception
{
    public string DocumentNumber { get; set; }

    public EmptyShipmentDocumentException(
        string documentNumber,
        string? message = null)
    : base(message ?? $"ShipmentDocument with Number = {documentNumber} has no embedded resources.")
    {
        DocumentNumber = documentNumber;
    }
}
