// DEMO: the provider contract. A parameterless operation returning a Board:
// no method body and no instance storage. A caller cannot construct it with new IBoardProvider().
namespace TreasureRules;

public interface IBoardProvider
{
    Board GetBoard();
}
