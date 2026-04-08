package main.java.data;

public class NumberItem extends DataItem{
    private double value;

    public NumberItem(double value){
        this.value = value;
    }

    public  Object getValue(){
        return value;
    }

    public  String getType(){
        return "number";
    }
}