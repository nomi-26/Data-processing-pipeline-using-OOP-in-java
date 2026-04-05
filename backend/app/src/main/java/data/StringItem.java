package backend.src.data;

public class StringItem extends DataItem{
    private String value;

    public StringItem(String value){
        this.value = value;
    }

    public  Object getValue(){
        return value;
    }

    public  String getType(){
        return "string";
    }
}