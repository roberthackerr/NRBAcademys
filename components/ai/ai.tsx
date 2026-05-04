interface props{
message:string
action :(content: string) => void;
}

export  function ai(
    {
        message,
        action
    }:props
){


 return(
    <div className="container">
        this is my components 
        <p>
            {message}
        </p>
    </div>
)



}