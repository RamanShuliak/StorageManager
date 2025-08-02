namespace StorageManagerServer.Services.Exceptions;

public class NegativeBalanceException : Exception
{
    public NegativeBalanceException(string message)
    : base(message)
    {
    }
}
