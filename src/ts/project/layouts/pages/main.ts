export function create(
    this: void,
    context: VC.LayoutContext
): VC.LayoutCallbacks {
    return {
        on_open(this: void): void {
            let someinfo = new LuaMap<string, number>()

            context.document.root?.add?.("<label text=\"Первый элемент\" pos=\"10,10\"/>")
        },
    };
}
