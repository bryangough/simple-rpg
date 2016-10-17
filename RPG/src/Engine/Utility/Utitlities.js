Utilties = function()
{
}
Utilties.customSortIso = function(a,b){
    //return Utilties.doNormal(a,b);
    //console.log(a,b);
    if(b.IsPlayer||a.IsPlayer)
    {

    }
    if(a.iso!=null && b.iso!=null)
    {
        if(a.IsPlayer)
        {
          //  console.log(a.iso);
        }
            
        if(a.iso.x<b.iso.x)
        {
            return 1;
        }
        else if(a.iso.x>b.iso.x)
        {
            return -1;
        }
        else
        {
            if(a.iso.z<b.iso.z)
            {
                return 1;
            }
            if(a.iso.z>b.iso.z)
            {
                return -1;
            }
        }
        if(a.iso.y<b.iso.y)
        {
            return -1;
        }
        else if(a.iso.y>b.iso.y)
        {
            return 1;
        }
        //
        if(a.isoorder<b.isoorder)
        {
            return -1;
        }
        else if(a.isoorder>b.isoorder)
        {
            return 1;
        }
    }
   //console.log(a.posy,b.posy);
    //if(b.posy%2==0)
    return Utilties.doNormal(a,b);
    //else
    //    return Utilties.doReverse(a,b);
    
    //return Utilties.byPos(a,b);
    
    //-1 if a > b, 1 if a < b or 0 if a === b
    //return 0;
};
Utilties.byPos = function(a,b){
    if(a.y==b.y)
    {
        if(a.x<b.x)
        {
            return 1;
        }
        else if(a.x>b.y)
        {
            return -1;
        }
    }
    else if(a.y<b.y)
    {
        return -1;
    }
    else if(a.y>b.y)
    {
        return 1;
    }
    return 0;
}
Utilties.doNormal = function(a,b){
    if(a.posy==b.posy)
    {
        if(a.posx<b.posx)
        {
            return 1;
        }
        else if(a.posx>b.posx)
        {
            return -1;
        }
        else
        {
            if(a.y<b.y)
            {
                return -1;
            }
            if(a.y>b.y)
            {
                return 1;
            }
        }
    }
    else if(a.posy<b.posy)
    {
        //console.log(a.posy,b.posy);
        return 1;
    }
    else if(a.posy>b.posy)
    {
        //console.log(a.posy,b.posy);
        return -1;
    }
    return 0;
}
Utilties.doReverse = function(a,b){
    if(a.posy==b.posy)
    {
        if(a.posx>b.posx)
        {
            return 1;
        }
        else if(a.posx<b.posx)
        {
            return -1;
        }
        else
        {
            if(a.y>b.y)
            {
                return -1;
            }
            if(a.y<b.y)
            {
                return 1;
            }
        }
    }
    else if(a.posy>b.posy)
    {
        return -1;
    }
    else if(a.posy<b.posy)
    {
        return 1;
    }
    return 0;
}
Utilties.customSortHexOffsetIso = function(a,b){
    //console.log(a,b);
    if(b.IsPlayer||a.IsPlayer)
    {
    //    console.log(a.posx, a.posy, b.posx, b.posy,a.y,b.y);
    }
    if(a.posy==b.posy)
    {
        if(a.posx<b.posx)
        {
            return 1;
        }
        else if(a.posx>b.posx)
        {
            return -1;
        }
        else
        {
            if(a.y<b.y)
            {
                return -1;
            }
            if(a.y>b.y)
            {
                return 1;
            }
        }
    }
    else if(a.posy<b.posy)
    {
        return -1;
    }
    else if(a.posy>b.posy)
    {
        return 1;
    }
    return 0;
    //-1 if a > b, 1 if a < b or 0 if a === b
    //test tile
    //if same tile test y
    //test level?
};